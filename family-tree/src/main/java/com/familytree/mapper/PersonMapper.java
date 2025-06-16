package com.familytree.mapper;

import com.familytree.model.Person;
import com.familytree.dto.PersonRequest;
import com.familytree.dto.PersonResponse;
import org.springframework.stereotype.Component;

@Component
public class PersonMapper {
    
    public Person toEntity(PersonRequest request) {
        if (request == null) {
            return null;
        }

        Person person = new Person();
        person.setFirstName(request.getFirstName());
        person.setLastName(request.getLastName());
        person.setDateOfBirth(request.getDateOfBirth());
        person.setDateOfDeath(request.getDateOfDeath());
        person.setGender(request.getGender());
        person.setEmail(request.getEmail());
        person.setPhoneNumber(request.getPhoneNumber());
        person.setAddress(request.getAddress());
        person.setGotra(request.getGotra());
        
        // Set father reference if fatherId is provided
        if (request.getFatherId() != null) {
            Person father = new Person();
            father.setId(request.getFatherId());
            person.setFather(father);
        }
        
        // Set mother reference if motherId is provided
        if (request.getMotherId() != null) {
            Person mother = new Person();
            mother.setId(request.getMotherId());
            person.setMother(mother);
        }
        
        return person;
    }
    
    public PersonResponse toResponse(Person person) {
        if (person == null) {
            return null;
        }

        PersonResponse response = new PersonResponse();
        response.setId(person.getId());
        response.setFirstName(person.getFirstName());
        response.setLastName(person.getLastName());
        response.setDateOfBirth(person.getDateOfBirth());
        response.setDateOfDeath(person.getDateOfDeath());
        response.setGender(person.getGender());
        response.setEmail(person.getEmail());
        response.setPhoneNumber(person.getPhoneNumber());
        response.setAddress(person.getAddress());
        response.setGotra(person.getGotra());
        
        // Set father information
        if (person.getFather() != null) {
            response.setFatherId(person.getFather().getId());
            response.setFatherName(person.getFather().getFirstName() + " " + person.getFather().getLastName());
        }
        
        // Set mother information
        if (person.getMother() != null) {
            response.setMotherId(person.getMother().getId());
            response.setMotherName(person.getMother().getFirstName() + " " + person.getMother().getLastName());
        }
        
        return response;
    }
} 