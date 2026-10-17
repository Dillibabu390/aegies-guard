package com.aegisguard.fraud.controller;

import com.aegisguard.fraud.model.TransactionAudit;
import com.aegisguard.fraud.service.TransactionAuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class TransactionAuditController {
    private final TransactionAuditService auditService;

    public TransactionAuditController(TransactionAuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping("/record")
    public ResponseEntity<Map<String, Object>> recordAudit(@RequestBody TransactionAudit audit) {
        TransactionAudit saved = auditService.saveAudit(audit);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Transaction audit successfully persisted to MongoDB");
        response.put("audit", saved);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> getLogs() {
        List<TransactionAudit> logs = auditService.getAllAudits();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("logs", logs);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/txn/{transactionId}")
    public ResponseEntity<Map<String, Object>> getByTransactionId(@PathVariable String transactionId) {
        Optional<TransactionAudit> audit = auditService.getAuditByTransactionId(transactionId);
        Map<String, Object> response = new HashMap<>();
        if (audit.isPresent()) {
            response.put("success", true);
            response.put("audit", audit.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Transaction audit record not found");
            return ResponseEntity.status(404).body(response);
        }
    }

    @PostMapping("/verify-challenge")
    public ResponseEntity<Map<String, Object>> verifyChallenge(@RequestBody Map<String, Object> body) {
        String transactionId = (String) body.get("transactionId");
        String otpCode = (String) body.get("otpCode");
        Boolean biometricConfirmed = (Boolean) body.get("biometricConfirmed");

        Optional<TransactionAudit> updated = auditService.resolveChallenge(transactionId, otpCode, biometricConfirmed);
        Map<String, Object> response = new HashMap<>();
        if (updated.isPresent()) {
            TransactionAudit audit = updated.get();
            boolean approved = audit.getDecision() != null && audit.getDecision().contains("APPROV");
            response.put("success", approved);
            response.put("transaction", audit);
            response.put("message", approved ? "Step-up authentication satisfied. Approved in MongoDB." : "Challenge verification failed.");
            return approved ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
        } else {
            response.put("success", false);
            response.put("message", "Transaction not found");
            return ResponseEntity.status(404).body(response);
        }
    }
}
