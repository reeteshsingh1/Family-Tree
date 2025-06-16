package com.familytree.controller;

import com.familytree.model.Person;
import com.familytree.model.Marriage;
import com.familytree.service.PersonService;
import com.familytree.dto.PersonRequest;
import com.familytree.dto.PersonResponse;
import com.familytree.mapper.PersonMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.HashMap;

@RestController
@RequestMapping("/api/persons")
@CrossOrigin(origins = {"http://localhost:8081", "http://localhost:8080"}, allowCredentials = "true")
public class PersonController {

    @Autowired
    private PersonService personService;

    @Autowired
    private PersonMapper personMapper;

    @GetMapping
    public ResponseEntity<?> getAllPersons() {
        List<Person> persons = personService.getAllPersons();
        List<PersonResponse> responses = persons.stream()
            .map(personMapper::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPerson(@PathVariable Long id) {
        try {
            return personService.getPersonById(id)
                .map(person -> ResponseEntity.ok(personMapper.toResponse(person)))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createPerson(@RequestBody PersonRequest request) {
        try {
            Person person = personMapper.toEntity(request);
            Person createdPerson = personService.createPerson(person);
            return ResponseEntity.ok(personMapper.toResponse(createdPerson));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePerson(@PathVariable Long id, @RequestBody PersonRequest request, HttpServletRequest httpRequest) {
        try {
            System.out.println("Received request to update person with ID: " + id);
            System.out.println("Request headers: " + Collections.list(httpRequest.getHeaderNames()).stream()
                .collect(Collectors.toMap(
                    headerName -> headerName,
                    httpRequest::getHeader
                )));
            System.out.println("Content-Type: " + httpRequest.getContentType());
            System.out.println("Person request data: " + request);
            
            if (request == null) {
                throw new IllegalArgumentException("Person data cannot be null");
            }
            
            Person person = personMapper.toEntity(request);
            person.setId(id);
            
            return personService.updatePerson(id, person)
                .map(updatedPerson -> ResponseEntity.ok(personMapper.toResponse(updatedPerson)))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.out.println("Error updating person: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePerson(@PathVariable Long id) {
        try {
            personService.deletePerson(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Person deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPersons(@RequestParam String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Collections.emptyList());
            }
            
            List<Person> persons = personService.searchPersons(query.trim());
            List<PersonResponse> responses = persons.stream()
                .map(personMapper::toResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(responses);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        }
    }

    @GetMapping("/{id}/parents")
    public ResponseEntity<?> getParents(@PathVariable Long id) {
        try {
            List<Person> parents = personService.getParents(id);
            List<PersonResponse> responses = parents.stream()
                .map(personMapper::toResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(responses);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        }
    }

    @GetMapping("/{id}/children")
    public ResponseEntity<?> getChildren(@PathVariable Long id) {
        try {
            List<Person> children = personService.getChildren(id);
            List<PersonResponse> responses = children.stream()
                .map(personMapper::toResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(responses);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        }
    }

    @GetMapping("/{id}/spouses")
    public ResponseEntity<?> getSpouses(@PathVariable Long id) {
        try {
            List<Person> spouses = personService.getSpouses(id);
            List<PersonResponse> responses = spouses.stream()
                .map(personMapper::toResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(responses);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
        }
    }

    @GetMapping("/{id}/marriages")
    public ResponseEntity<List<Marriage>> getMarriages(@PathVariable Long id) {
        try {
            List<Marriage> marriages = personService.getMarriagesByPersonId(id);
            return ResponseEntity.ok(marriages);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/marriage")
    public ResponseEntity<?> createMarriage(@RequestBody Map<String, Object> marriageDetails) {
        try {
            // Validate required fields
            if (!marriageDetails.containsKey("person1Id") || !marriageDetails.containsKey("person2Id") || !marriageDetails.containsKey("marriageDate")) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Missing required fields: person1Id, person2Id, or marriageDate");
                return ResponseEntity.badRequest().body(response);
            }

            // Parse and validate person IDs
            Long person1Id;
            Long person2Id;
            try {
                person1Id = Long.valueOf(marriageDetails.get("person1Id").toString());
                person2Id = Long.valueOf(marriageDetails.get("person2Id").toString());
            } catch (NumberFormatException e) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Invalid person ID format");
                return ResponseEntity.badRequest().body(response);
            }

            // Parse and validate marriage date
            String marriageDateStr = marriageDetails.get("marriageDate").toString();
            LocalDate marriageDate;
            try {
                marriageDate = LocalDate.parse(marriageDateStr);
            } catch (DateTimeParseException e) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Invalid date format. Please use YYYY-MM-DD format");
                return ResponseEntity.badRequest().body(response);
            }

            // Create marriage
            Marriage marriage = personService.createMarriage(person1Id, person2Id, marriageDate);
            return ResponseEntity.ok(marriage);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
} 