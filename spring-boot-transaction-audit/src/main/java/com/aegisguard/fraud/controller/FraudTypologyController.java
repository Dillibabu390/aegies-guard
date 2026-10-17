package com.aegisguard.fraud.controller;

import com.aegisguard.fraud.model.FraudTypology;
import com.aegisguard.fraud.repository.FraudTypologyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/typologies")
@CrossOrigin(origins = "*")
public class FraudTypologyController {
    private final FraudTypologyRepository typologyRepository;

    public FraudTypologyController(FraudTypologyRepository typologyRepository) {
        this.typologyRepository = typologyRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTypologies() {
        List<FraudTypology> typologies = typologyRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("typologies", typologies);
        return ResponseEntity.ok(response);
    }
}
