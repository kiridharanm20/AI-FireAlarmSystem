package com.firealarm.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.firealarm.entity.WarningLog;
import com.firealarm.repository.WarningLogRepository;
import java.util.List;

@Service
public class WarningLogService {

    @Autowired
    private WarningLogRepository repository;

    public List<WarningLog> getAllLogs() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public WarningLog getLogById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public WarningLog createLog(WarningLog log) {
        return repository.save(log);
    }

    public void clearResolvedLogs() {
        repository.deleteResolvedLogs();
    }
}
