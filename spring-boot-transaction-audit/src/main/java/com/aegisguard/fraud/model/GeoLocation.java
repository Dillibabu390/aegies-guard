package com.aegisguard.fraud.model;

public class GeoLocation {
    private Double lat;
    private Double lng;
    private String city;
    private String country;
    private Long timestamp;

    public GeoLocation() {}

    public GeoLocation(Double lat, Double lng, String city, String country, Long timestamp) {
        this.lat = lat;
        this.lng = lng;
        this.city = city;
        this.country = country;
        this.timestamp = timestamp;
    }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
}
