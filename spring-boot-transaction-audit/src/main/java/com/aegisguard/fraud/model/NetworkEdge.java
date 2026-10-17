package com.aegisguard.fraud.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "network_edges")
public class NetworkEdge {
    @Id
    private String id;
    private String source;
    private String target;
    private Double weight;
    private Integer count;
    private String type;

    public NetworkEdge() {}

    public NetworkEdge(String source, String target, Double weight, Integer count, String type) {
        this.source = source;
        this.target = target;
        this.weight = weight;
        this.count = count;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
