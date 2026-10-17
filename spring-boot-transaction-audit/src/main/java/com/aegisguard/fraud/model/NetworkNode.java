package com.aegisguard.fraud.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "network_nodes")
public class NetworkNode {
    @Id
    private String id;
    private String label;
    private String type; // user, merchant, mule_hub, mule_satellite, crypto_sink
    private String riskLevel; // low, medium, high, critical
    private Double balance;
    private Integer flaggedCount;
    private Integer inDegree;
    private Boolean verified;
    private Boolean sanctioned;

    public NetworkNode() {}

    public NetworkNode(String id, String label, String type, String riskLevel, Double balance, Integer flaggedCount, Integer inDegree, Boolean verified, Boolean sanctioned) {
        this.id = id;
        this.label = label;
        this.type = type;
        this.riskLevel = riskLevel;
        this.balance = balance;
        this.flaggedCount = flaggedCount;
        this.inDegree = inDegree;
        this.verified = verified;
        this.sanctioned = sanctioned;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public Integer getFlaggedCount() { return flaggedCount; }
    public void setFlaggedCount(Integer flaggedCount) { this.flaggedCount = flaggedCount; }

    public Integer getInDegree() { return inDegree; }
    public void setInDegree(Integer inDegree) { this.inDegree = inDegree; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public Boolean getSanctioned() { return sanctioned; }
    public void setSanctioned(Boolean sanctioned) { this.sanctioned = sanctioned; }
}
