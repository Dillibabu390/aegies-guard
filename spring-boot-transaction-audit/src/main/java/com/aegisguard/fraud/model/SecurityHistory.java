package com.aegisguard.fraud.model;

public class SecurityHistory {
    private Long lastMpinReset;
    private Integer recentFailedLogins;
    private Boolean simSwapFlag;
    private Integer accountAgeDays;
    private Integer priorFraudIncidents;

    public SecurityHistory() {}

    public SecurityHistory(Long lastMpinReset, Integer recentFailedLogins, Boolean simSwapFlag, Integer accountAgeDays, Integer priorFraudIncidents) {
        this.lastMpinReset = lastMpinReset;
        this.recentFailedLogins = recentFailedLogins;
        this.simSwapFlag = simSwapFlag;
        this.accountAgeDays = accountAgeDays;
        this.priorFraudIncidents = priorFraudIncidents;
    }

    public Long getLastMpinReset() { return lastMpinReset; }
    public void setLastMpinReset(Long lastMpinReset) { this.lastMpinReset = lastMpinReset; }

    public Integer getRecentFailedLogins() { return recentFailedLogins; }
    public void setRecentFailedLogins(Integer recentFailedLogins) { this.recentFailedLogins = recentFailedLogins; }

    public Boolean getSimSwapFlag() { return simSwapFlag; }
    public void setSimSwapFlag(Boolean simSwapFlag) { this.simSwapFlag = simSwapFlag; }

    public Integer getAccountAgeDays() { return accountAgeDays; }
    public void setAccountAgeDays(Integer accountAgeDays) { this.accountAgeDays = accountAgeDays; }

    public Integer getPriorFraudIncidents() { return priorFraudIncidents; }
    public void setPriorFraudIncidents(Integer priorFraudIncidents) { this.priorFraudIncidents = priorFraudIncidents; }
}
