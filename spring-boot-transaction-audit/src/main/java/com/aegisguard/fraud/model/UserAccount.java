package com.aegisguard.fraud.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "user_accounts")
public class UserAccount {
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String accountNumber;
    private Double balance;
    private SpendingProfile spendingProfile;
    private GeoLocation lastKnownLocation;
    private List<String> trustedDevices;
    private SecurityHistory securityHistory;
    private String idCardPhoto;
    private String knownFacePhoto;

    public UserAccount() {}

    public UserAccount(String id, String name, String email, String phone, String accountNumber, Double balance,
                       SpendingProfile spendingProfile, GeoLocation lastKnownLocation, List<String> trustedDevices,
                       SecurityHistory securityHistory, String idCardPhoto, String knownFacePhoto) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.spendingProfile = spendingProfile;
        this.lastKnownLocation = lastKnownLocation;
        this.trustedDevices = trustedDevices;
        this.securityHistory = securityHistory;
        this.idCardPhoto = idCardPhoto;
        this.knownFacePhoto = knownFacePhoto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public SpendingProfile getSpendingProfile() { return spendingProfile; }
    public void setSpendingProfile(SpendingProfile spendingProfile) { this.spendingProfile = spendingProfile; }

    public GeoLocation getLastKnownLocation() { return lastKnownLocation; }
    public void setLastKnownLocation(GeoLocation lastKnownLocation) { this.lastKnownLocation = lastKnownLocation; }

    public List<String> getTrustedDevices() { return trustedDevices; }
    public void setTrustedDevices(List<String> trustedDevices) { this.trustedDevices = trustedDevices; }

    public SecurityHistory getSecurityHistory() { return securityHistory; }
    public void setSecurityHistory(SecurityHistory securityHistory) { this.securityHistory = securityHistory; }

    public String getIdCardPhoto() { return idCardPhoto; }
    public void setIdCardPhoto(String idCardPhoto) { this.idCardPhoto = idCardPhoto; }

    public String getKnownFacePhoto() { return knownFacePhoto; }
    public void setKnownFacePhoto(String knownFacePhoto) { this.knownFacePhoto = knownFacePhoto; }
}
