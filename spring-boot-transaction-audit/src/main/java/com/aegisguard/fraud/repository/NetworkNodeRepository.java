package com.aegisguard.fraud.repository;

import com.aegisguard.fraud.model.NetworkNode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NetworkNodeRepository extends MongoRepository<NetworkNode, String> {
}
