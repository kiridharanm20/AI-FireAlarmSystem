package com.firealarm.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.firealarm.entity.WarningLog;
import com.firealarm.service.WarningLogService;
import java.util.List;

@RestController
@RequestMapping("/api/warning-logs")
@CrossOrigin(origins = "http://localhost:3000")
public class WarningLogController {

    @Autowired
    private WarningLogService service;

    @GetMapping
    public List<WarningLog> getAllLogs() {
        return service.getAllLogs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarningLog> getLogById(@PathVariable Long id) {
        WarningLog log = service.getLogById(id);
        if (log != null) {
            return ResponseEntity.ok(log);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public WarningLog createLog(@RequestBody WarningLog log) {
        return service.createLog(log);
    }

    @DeleteMapping("/resolved")
    public ResponseEntity<?> clearResolvedLogs() {
        service.clearResolvedLogs();
        return ResponseEntity.ok().body("{\"message\": \"Resolved warning logs cleared successfully.\"}");
    }
}
