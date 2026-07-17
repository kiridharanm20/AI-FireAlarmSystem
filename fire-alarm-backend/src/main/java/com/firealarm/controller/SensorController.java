package com.firealarm.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.firealarm.entity.Sensor;
import com.firealarm.repository.SensorRepository;

@RestController
@RequestMapping("/api/sensors")
@CrossOrigin(origins = "http://localhost:3000")
public class SensorController {

    @Autowired
    private SensorRepository repository;

    @PostMapping
    public Sensor addSensor(
            @RequestBody Sensor sensor) {

        return repository.save(sensor);
    }

    @GetMapping
    public List<Sensor> getAllSensors() {

        return repository.findAll();
    }
    @GetMapping("/{id}")
    public Sensor getSensorById(@PathVariable Long id) {

        return repository.findById(id)
            .orElseThrow(() ->
                new RuntimeException("Sensor not found"));
    }
    @PutMapping("/{id}")
public Sensor updateSensor(
        @PathVariable Long id,
        @RequestBody Sensor updatedSensor) {

    Sensor sensor = repository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Sensor not found"));

    sensor.setLocation(updatedSensor.getLocation());
    sensor.setSensorType(updatedSensor.getSensorType());
    sensor.setStatus(updatedSensor.getStatus());
    sensor.setSeverity(updatedSensor.getSeverity());

    return repository.save(sensor);
}

@DeleteMapping("/{id}")
public String deleteSensor(
        @PathVariable Long id) {

    repository.deleteById(id);

    return "Sensor Deleted";
}
}