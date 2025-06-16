package com.familytree.service;

import com.familytree.model.Person;
import com.familytree.model.Marriage;
import com.familytree.repository.PersonRepository;
import com.familytree.repository.MarriageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.time.LocalDate;

@Service
public class PersonService {
    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private MarriageRepository marriageRepository;

    public List<Person> getAllPersons() {
        return personRepository.findAll();
    }

    public Optional<Person> getPersonById(Long id) {
        return personRepository.findById(id);
    }

    public List<Person> searchPersons(String query) {
        return personRepository.findByFirstNameContainingOrLastNameContaining(query, query);
    }

    @Transactional
    public Person createPerson(Person person) {
        if (person == null) {
            throw new IllegalArgumentException("Person cannot be null");
        }
        if (person.getFirstName() == null || person.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (person.getLastName() == null || person.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (person.getDateOfBirth() == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }
        if (person.getGender() == null) {
            throw new IllegalArgumentException("Gender is required");
        }
        if (person.getGotra() == null || person.getGotra().trim().isEmpty()) {
            throw new IllegalArgumentException("Gotra is required");
        }

        return personRepository.save(person);
    }

    @Transactional
    public Optional<Person> updatePerson(Long id, Person person) {
        if (person == null) {
            throw new IllegalArgumentException("Person cannot be null");
        }
        if (person.getFirstName() == null || person.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (person.getLastName() == null || person.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (person.getDateOfBirth() == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }
        if (person.getGender() == null) {
            throw new IllegalArgumentException("Gender is required");
        }
        if (person.getGotra() == null || person.getGotra().trim().isEmpty()) {
            throw new IllegalArgumentException("Gotra is required");
        }

        return personRepository.findById(id)
            .map(existingPerson -> {
                existingPerson.setFirstName(person.getFirstName());
                existingPerson.setLastName(person.getLastName());
                existingPerson.setDateOfBirth(person.getDateOfBirth());
                existingPerson.setDateOfDeath(person.getDateOfDeath());
                existingPerson.setGender(person.getGender());
                existingPerson.setEmail(person.getEmail());
                existingPerson.setPhoneNumber(person.getPhoneNumber());
                existingPerson.setAddress(person.getAddress());
                existingPerson.setGotra(person.getGotra());
                existingPerson.setFather(person.getFather());
                existingPerson.setMother(person.getMother());
                return personRepository.save(existingPerson);
            });
    }

    @Transactional
    public void deletePerson(Long id) {
        personRepository.deleteById(id);
    }

    public List<Person> getParents(Long personId) {
        if (personId == null) {
            throw new IllegalArgumentException("Person ID cannot be null");
        }
        
        try {
            Optional<Person> person = personRepository.findById(personId);
            if (person.isPresent()) {
                Person p = person.get();
                List<Person> parents = new ArrayList<>();
                
                if (p.getFather() != null) {
                    parents.add(p.getFather());
                }
                if (p.getMother() != null) {
                    parents.add(p.getMother());
                }
                return parents;
            }
            return new ArrayList<>();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching parents: " + e.getMessage());
        }
    }

    public List<Person> getChildren(Long personId) {
        if (personId == null) {
            throw new IllegalArgumentException("Person ID cannot be null");
        }
        
        try {
            Optional<Person> person = personRepository.findById(personId);
            if (person.isPresent()) {
                Person p = person.get();
                List<Person> children = new ArrayList<>();
                
                for (Person child : p.getChildrenAsFather()) {
                    children.add(child);
                }
                for (Person child : p.getChildrenAsMother()) {
                    children.add(child);
                }
                return children;
            }
            return new ArrayList<>();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching children: " + e.getMessage());
        }
    }

    public List<Person> getSpouses(Long personId) {
        if (personId == null) {
            throw new IllegalArgumentException("Person ID cannot be null");
        }
        
        try {
            Optional<Person> person = personRepository.findById(personId);
            if (person.isPresent()) {
                Person p = person.get();
                List<Person> spouses = new ArrayList<>();
                
                for (Marriage m : p.getMarriagesAsPerson1()) {
                    spouses.add(m.getPerson2());
                }
                for (Marriage m : p.getMarriagesAsPerson2()) {
                    spouses.add(m.getPerson1());
                }
                return spouses;
            }
            return new ArrayList<>();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching spouses: " + e.getMessage());
        }
    }

    @Transactional
    public Marriage createMarriage(Long person1Id, Long person2Id, LocalDate marriageDate) {
        if (person1Id == null || person2Id == null) {
            throw new IllegalArgumentException("Person IDs cannot be null");
        }
        if (marriageDate == null) {
            throw new IllegalArgumentException("Marriage date cannot be null");
        }
        
        try {
            Optional<Person> person1 = personRepository.findById(person1Id);
            Optional<Person> person2 = personRepository.findById(person2Id);
            
            if (!person1.isPresent() || !person2.isPresent()) {
                throw new IllegalArgumentException("One or both persons not found");
            }

            // Check if marriage already exists in either direction
            List<Marriage> existingMarriages = marriageRepository.findByPerson1IdAndPerson2IdOrPerson2IdAndPerson1Id(
                person1Id, person2Id, person1Id, person2Id);
            
            if (!existingMarriages.isEmpty()) {
                throw new IllegalArgumentException("A marriage already exists between these persons");
            }
            
            Marriage marriage = new Marriage();
            marriage.setPerson1(person1.get());
            marriage.setPerson2(person2.get());
            marriage.setMarriageDate(marriageDate);
            marriage.setStatus("ACTIVE");
            return marriageRepository.save(marriage);
        } catch (Exception e) {
            throw new RuntimeException("Error creating marriage: " + e.getMessage());
        }
    }

    public List<Marriage> getMarriagesByPersonId(Long personId) {
        if (personId == null) {
            throw new IllegalArgumentException("Person ID cannot be null");
        }
        
        try {
            return marriageRepository.findByPerson1IdOrPerson2Id(personId, personId);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching marriages: " + e.getMessage());
        }
    }
} 