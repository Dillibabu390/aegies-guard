package com.aegisguard.fraud.repository;

import com.aegisguard.fraud.model.TransactionAudit;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionAuditRepository extends MongoRepository<TransactionAudit, String> {
    Optional<TransactionAudit> findByTransactionId(String transactionId);
    List<TransactionAudit> findByUserIdOrderByTimestampDesc(String userId);
    List<TransactionAudit> findAllByOrderByTimestampDesc();
}
