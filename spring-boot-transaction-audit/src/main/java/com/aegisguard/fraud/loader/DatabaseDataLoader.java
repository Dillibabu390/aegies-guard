package com.aegisguard.fraud.loader;

import com.aegisguard.fraud.model.*;
import com.aegisguard.fraud.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseDataLoader implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DatabaseDataLoader.class);

    private final UserAccountRepository userRepository;
    private final FraudTypologyRepository typologyRepository;
    private final NetworkNodeRepository nodeRepository;
    private final NetworkEdgeRepository edgeRepository;

    public DatabaseDataLoader(UserAccountRepository userRepository,
                              FraudTypologyRepository typologyRepository,
                              NetworkNodeRepository nodeRepository,
                              NetworkEdgeRepository edgeRepository) {
        this.userRepository = userRepository;
        this.typologyRepository = typologyRepository;
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Checking and seeding MongoDB with master fraud telemetry and user entities...");

        seedUsers();
        seedTypologies();
        seedGraph();

        log.info("MongoDB Data Initialization completed successfully. Connected collections ready for Python AI Agents.");
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Seeding master User Accounts into MongoDB collection 'user_accounts'...");

            long now = System.currentTimeMillis();

            // 1. Alex Chen
            UserAccount alex = new UserAccount(
                    "usr_alex_chen",
                    "Alex Chen",
                    "alex.chen@fintech.io",
                    "+886-912-345-678",
                    "ACC_77189021",
                    14850.00,
                    new SpendingProfile(65.0, 30.0, Arrays.asList(8, 22), Arrays.asList("Taipei City, TW", "New Taipei, TW")),
                    new GeoLocation(25.0330, 121.5654, "Taipei", "TW", now - (25 * 60 * 1000)),
                    Arrays.asList("dev_fp_iphone15_alex_tw", "dev_fp_macbook_m3_alex"),
                    new SecurityHistory(null, 0, false, 840, 0),
                    "/assets/id_card_alex.jpg",
                    "/assets/selfie_alex_match.jpg"
            );

            // 2. Sarah Connor
            UserAccount sarah = new UserAccount(
                    "usr_sarah_connor",
                    "Sarah Connor",
                    "s.connor@cybersec.org",
                    "+1-555-019-2831",
                    "ACC_99214300",
                    42100.00,
                    new SpendingProfile(140.0, 80.0, Arrays.asList(7, 23), Arrays.asList("San Francisco, US")),
                    new GeoLocation(37.7749, -122.4194, "San Francisco", "US", now - (45 * 60 * 1000)),
                    List.of("dev_fp_pixel8_sarah"),
                    new SecurityHistory(now - (3 * 3600 * 1000), 4, true, 410, 0),
                    "/assets/id_card_alex.jpg",
                    "/assets/selfie_alex_match.jpg"
            );

            userRepository.saveAll(Arrays.asList(alex, sarah));
            log.info("Seeded 2 master user profiles to MongoDB.");
        }
    }

    private void seedTypologies() {
        if (typologyRepository.count() == 0) {
            log.info("Seeding Fraud Typologies into MongoDB collection 'fraud_typologies'...");

            List<FraudTypology> typologies = Arrays.asList(
                    new FraudTypology(
                            "typology_sim_mpin_drain",
                            "SIM Swap followed by MPIN Reset & Instant Outbound Transfer",
                            "Adversary executes unauthorized SIM porting, requests emergency MPIN/password reset within 24 hours, adds new unverified beneficiary, and executes high-velocity liquidation.",
                            Arrays.asList("recent_mpin_reset_24h", "sim_swap_telemetry", "new_beneficiary", "velocity_spike"),
                            23,
                            Arrays.asList("mpin", "sim swap", "password reset", "takeover", "unauthorized", "drain", "fast liquidation")
                    ),
                    new FraudTypology(
                            "typology_impossible_travel_vpn",
                            "Impossible Geo Travel Jump via Proxy/Tor Exit Node",
                            "Session origin switches to an IP thousands of kilometers away within minutes of previous activity, indicating credential stuffing or session hijacking through overseas VPN/Tor.",
                            Arrays.asList("impossible_geo_velocity", "untrusted_device", "datacenter_ip", "vpn_exit"),
                            24,
                            Arrays.asList("vpn", "tor", "impossible travel", "geo jump", "unrecognized device", "proxy")
                    ),
                    new FraudTypology(
                            "typology_money_mule_layering",
                            "Money Mule Network Clustering & Rapid Layering",
                            "Beneficiary account sits in a dense star cluster with high in-degree transactions from disparate compromised accounts, followed by immediate zero-balance dispersal to offshore or crypto gates.",
                            Arrays.asList("high_indegree_beneficiary", "mule_cluster_link", "rapid_dispersal", "sanctioned_neighbor"),
                            22,
                            Arrays.asList("mule", "cluster", "layering", "laundering", "crypto gate", "fan out", "shell")
                    ),
                    new FraudTypology(
                            "typology_biometric_deepfake_presentation",
                            "Biometric Presentation Attack & Tampered Document KYC Bypass",
                            "Facial verification telemetry displays digital screen reflection, static eye gaze, pixel warping around face boundary, or tampered document font inconsistencies.",
                            Arrays.asList("spoof_screen_replay", "face_mismatch", "tampered_ocr", "liveness_failed"),
                            25,
                            Arrays.asList("deepfake", "spoof", "tampered", "mismatch", "mask", "screen replay", "reconstructed photo")
                    ),
                    new FraudTypology(
                            "typology_card_cracking_velocity",
                            "Automated Micro-Velocity Card Cracking Attack",
                            "Scripted bot execution triggering multiple rapid authorization attempts within an hour to probe limit thresholds.",
                            Arrays.asList("hourly_velocity_exceeded", "amount_anomalous", "bot_fingerprint"),
                            19,
                            Arrays.asList("bot", "rapid velocity", "micro charges", "brute force", "automated")
                    )
            );

            typologyRepository.saveAll(typologies);
            log.info("Seeded 5 fraud typologies to MongoDB.");
        }
    }

    private void seedGraph() {
        if (nodeRepository.count() == 0) {
            log.info("Seeding Transaction Network Graph nodes and edges into MongoDB...");

            List<NetworkNode> nodes = Arrays.asList(
                    new NetworkNode("ACC_77189021", "Alex Chen (Main)", "user", "low", 14850.0, 0, 1, true, false),
                    new NetworkNode("ACC_99214300", "Sarah Connor", "user", "medium", 42100.0, 1, 1, true, false),
                    new NetworkNode("MERCHANT_COFFEE_BEANS", "Artisan Coffee Co.", "merchant", "low", 0.0, 0, 18, true, false),
                    new NetworkNode("MERCHANT_TECHMART_GLOBAL", "TechMart Electronics", "merchant", "low", 0.0, 0, 8, true, false),
                    new NetworkNode("ACC_MULE_HUB_99", "Mule Aggregator #99", "mule_hub", "critical", 0.0, 14, 28, false, false),
                    new NetworkNode("ACC_MULE_SATELLITE_A", "Shadow Mule Alpha", "mule_satellite", "high", 0.0, 6, 2, false, false),
                    new NetworkNode("ACC_MULE_SATELLITE_B", "Shadow Mule Beta", "mule_satellite", "high", 0.0, 8, 3, false, false),
                    new NetworkNode("CRYPTO_OFFRAMP_VAULT", "Unregulated Crypto Mixer", "crypto_sink", "critical", 0.0, 29, 34, false, true),
                    new NetworkNode("ACC_CLEAN_LANDLORD", "Taipei Realty Mgmt", "merchant", "low", 0.0, 0, 5, true, false)
            );
            nodeRepository.saveAll(nodes);

            List<NetworkEdge> edges = Arrays.asList(
                    new NetworkEdge("ACC_77189021", "MERCHANT_COFFEE_BEANS", 4.80, 18, "regular"),
                    new NetworkEdge("ACC_77189021", "ACC_CLEAN_LANDLORD", 1200.00, 6, "rent"),
                    new NetworkEdge("ACC_77189021", "MERCHANT_TECHMART_GLOBAL", 349.00, 2, "retail"),
                    new NetworkEdge("ACC_MULE_SATELLITE_A", "ACC_MULE_HUB_99", 4500.00, 12, "funnel"),
                    new NetworkEdge("ACC_MULE_SATELLITE_B", "ACC_MULE_HUB_99", 6800.00, 15, "funnel"),
                    new NetworkEdge("ACC_MULE_HUB_99", "CRYPTO_OFFRAMP_VAULT", 28000.00, 34, "wash")
            );
            edgeRepository.saveAll(edges);

            log.info("Seeded 9 graph nodes and 6 edges to MongoDB.");
        }
    }
}
