package com.aegisguard.fraud.service;

import com.aegisguard.fraud.model.TransactionAudit;
import com.aegisguard.fraud.model.UserAccount;
import com.aegisguard.fraud.repository.TransactionAuditRepository;
import com.aegisguard.fraud.repository.UserAccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionAuditService {
    private final TransactionAuditRepository auditRepository;
    private final UserAccountRepository userRepository;

    public TransactionAuditService(TransactionAuditRepository auditRepository, UserAccountRepository userRepository) {
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
    }

    public TransactionAudit saveAudit(TransactionAudit audit) {
        // If approved, update user balance in MongoDB
        if (audit.getDecision() != null && audit.getDecision().contains("APPROV")) {
            if (audit.getUserId() != null && audit.getAmount() != null) {
                userRepository.findById(audit.getUserId()).ifPresent(user -> {
                    double currentBal = user.getBalance() != null ? user.getBalance() : 0.0;
                    user.setBalance(Math.max(0.0, currentBal - audit.getAmount()));
                    userRepository.save(user);
                });
            }
        }
        return auditRepository.save(audit);
    }

    public List<TransactionAudit> getAllAudits() {
        return auditRepository.findAllByOrderByTimestampDesc();
    }

    public Optional<TransactionAudit> getAuditByTransactionId(String transactionId) {
        return auditRepository.findByTransactionId(transactionId);
    }

    public Optional<TransactionAudit> resolveChallenge(String transactionId, String otpCode, Boolean biometricConfirmed) {
        Optional<TransactionAudit> opt = auditRepository.findByTransactionId(transactionId);
        if (opt.isPresent()) {
            TransactionAudit audit = opt.get();
            boolean valid = (otpCode != null && otpCode.matches("\\d{6}")) || Boolean.TRUE.equals(biometricConfirmed);
            if (valid) {
                audit.setStepUpStatus("STEP_UP_VERIFIED_APPROVED");
                audit.setDecision("APPROVED_POST_CHALLENGE");
                audit.setRecommendedActionText("Step-up authentication successfully satisfied. Cleared in MongoDB audit ledger.");
                // Update balance
                if (audit.getUserId() != null && audit.getAmount() != null) {
                    userRepository.findById(audit.getUserId()).ifPresent(user -> {
                        double currentBal = user.getBalance() != null ? user.getBalance() : 0.0;
                        user.setBalance(Math.max(0.0, currentBal - audit.getAmount()));
                        userRepository.save(user);
                    });
                }
            } else {
                audit.setStepUpStatus("STEP_UP_CHALLENGE_FAILED");
                audit.setDecision("BLOCKED_CHALLENGE_FAILED");
                audit.setRecommendedActionText("Step-up authentication failed. Suspicious transaction locked.");
            }
            return Optional.of(auditRepository.save(audit));
        }
        return Optional.empty();
    }
}
