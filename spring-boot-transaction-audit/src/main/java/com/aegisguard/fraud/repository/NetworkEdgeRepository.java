package com.aegisguard.fraud.repository;

import com.aegisguard.fraud.model.NetworkEdge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NetworkEdgeRepository extends MongoRepository<NetworkEdge, String> {
    List<NetworkEdge> findBySourceOrTarget(String source, String target);
}
