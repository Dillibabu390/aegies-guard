package com.aegisguard.fraud.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "fraud_typologies")
public class FraudTypology {
    @Id
    private String id;
    private String title;
    private String description;
    private List<String> riskFactors;
    private Integer baseRiskScore;
    private List<String> keywords;

    public FraudTypology() {}

    public FraudTypology(String id, String title, String description, List<String> riskFactors, Integer baseRiskScore, List<String> keywords) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.riskFactors = riskFactors;
        this.baseRiskScore = baseRiskScore;
        this.keywords = keywords;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getRiskFactors() { return riskFactors; }
    public void setRiskFactors(List<String> riskFactors) { this.riskFactors = riskFactors; }

    public Integer getBaseRiskScore() { return baseRiskScore; }
    public void setBaseRiskScore(Integer baseRiskScore) { this.baseRiskScore = baseRiskScore; }

    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }
}
