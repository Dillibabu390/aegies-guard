package com.aegisguard.fraud.model;

import java.util.List;

public class SpendingProfile {
    private Double averageAmount;
    private Double standardDeviation;
    private List<Integer> typicalHours;
    private List<String> frequentLocations;

    public SpendingProfile() {}

    public SpendingProfile(Double averageAmount, Double standardDeviation, List<Integer> typicalHours, List<String> frequentLocations) {
        this.averageAmount = averageAmount;
        this.standardDeviation = standardDeviation;
        this.typicalHours = typicalHours;
        this.frequentLocations = frequentLocations;
    }

    public Double getAverageAmount() { return averageAmount; }
    public void setAverageAmount(Double averageAmount) { this.averageAmount = averageAmount; }

    public Double getStandardDeviation() { return standardDeviation; }
    public void setStandardDeviation(Double standardDeviation) { this.standardDeviation = standardDeviation; }

    public List<Integer> getTypicalHours() { return typicalHours; }
    public void setTypicalHours(List<Integer> typicalHours) { this.typicalHours = typicalHours; }

    public List<String> getFrequentLocations() { return frequentLocations; }
    public void setFrequentLocations(List<String> frequentLocations) { this.frequentLocations = frequentLocations; }
}
