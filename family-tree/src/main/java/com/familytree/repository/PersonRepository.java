package com.familytree.repository;

import com.familytree.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    List<Person> findByFirstNameContainingOrLastNameContaining(String firstName, String lastName);
} 