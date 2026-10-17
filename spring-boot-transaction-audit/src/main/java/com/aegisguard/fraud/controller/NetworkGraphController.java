package com.aegisguard.fraud.controller;

import com.aegisguard.fraud.model.NetworkEdge;
import com.aegisguard.fraud.model.NetworkNode;
import com.aegisguard.fraud.repository.NetworkEdgeRepository;
import com.aegisguard.fraud.repository.NetworkNodeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/graph")
@CrossOrigin(origins = "*")
public class NetworkGraphController {
    private final NetworkNodeRepository nodeRepository;
    private final NetworkEdgeRepository edgeRepository;

    public NetworkGraphController(NetworkNodeRepository nodeRepository, NetworkEdgeRepository edgeRepository) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getGraph() {
        List<NetworkNode> nodes = nodeRepository.findAll();
        List<NetworkEdge> edges = edgeRepository.findAll();

        Map<String, Object> graph = new HashMap<>();
        graph.put("nodes", nodes);
        graph.put("edges", edges);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("graph", graph);
        return ResponseEntity.ok(response);
    }
}
