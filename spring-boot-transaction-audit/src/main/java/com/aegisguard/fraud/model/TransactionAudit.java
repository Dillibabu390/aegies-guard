package com.aegisguard.fraud.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "transaction_audits")
public class TransactionAudit {
    @Id
    private String id;
    private String transactionId;
    private String timestamp;
    private String userId;
    private String userName;
    private String userAccount;
    private Double amount;
    private String currency;
    private String memo;
    private String beneficiaryName;
    private String beneficiaryAccount;
    private Integer totalRiskScore;
    private String decision;
    private String decisionLevel;
    private String actionRequired;
    private String recommendedActionText;
    private Integer agent1Score;
    private Integer agent2Score;
    private Integer agent3Score;
    private Integer agent4Score;
    private String stepUpStatus;
    private Long pipelineLatencyMs;
    private Map<String, Object> rawDossier;

    public TransactionAudit() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserAccount() { return userAccount; }
    public void setUserAccount(String userAccount) { this.userAccount = userAccount; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getMemo() { return memo; }
    public void setMemo(String memo) { this.memo = memo; }

    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }

    public String getBeneficiaryAccount() { return beneficiaryAccount; }
    public void setBeneficiaryAccount(String beneficiaryAccount) { this.beneficiaryAccount = beneficiaryAccount; }

    public Integer getTotalRiskScore() { return totalRiskScore; }
    public void setTotalRiskScore(Integer totalRiskScore) { this.totalRiskScore = totalRiskScore; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getDecisionLevel() { return decisionLevel; }
    public void setDecisionLevel(String decisionLevel) { this.decisionLevel = decisionLevel; }

    public String getActionRequired() { return actionRequired; }
    public void setActionRequired(String actionRequired) { this.actionRequired = actionRequired; }

    public String getRecommendedActionText() { return recommendedActionText; }
    public void setRecommendedActionText(String recommendedActionText) { this.recommendedActionText = recommendedActionText; }

    public Integer getAgent1Score() { return agent1Score; }
    public void setAgent1Score(Integer agent1Score) { this.agent1Score = agent1Score; }

    public Integer getAgent2Score() { return agent2Score; }
    public void setAgent2Score(Integer agent2Score) { this.agent2Score = agent2Score; }

    public Integer getAgent3Score() { return agent3Score; }
    public void setAgent3Score(Integer agent3Score) { this.agent3Score = agent3Score; }

    public Integer getAgent4Score() { return agent4Score; }
    public void setAgent4Score(Integer agent4Score) { this.agent4Score = agent4Score; }

    public String getStepUpStatus() { return stepUpStatus; }
    public void setStepUpStatus(String stepUpStatus) { this.stepUpStatus = stepUpStatus; }

    public Long getPipelineLatencyMs() { return pipelineLatencyMs; }
    public void setPipelineLatencyMs(Long pipelineLatencyMs) { this.pipelineLatencyMs = pipelineLatencyMs; }

    public Map<String, Object> getRawDossier() { return rawDossier; }
    public void setRawDossier(Map<String, Object> rawDossier) { this.rawDossier = rawDossier; }
}
