package com.aegisguard.fraud.repository;

import com.aegisguard.fraud.model.FraudTypology;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FraudTypologyRepository extends MongoRepository<FraudTypology, String> {
}
