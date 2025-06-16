package com.familytree.repository;

import com.familytree.model.Marriage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MarriageRepository extends JpaRepository<Marriage, Long> {
    List<Marriage> findByPerson1IdOrPerson2Id(Long person1Id, Long person2Id);
    
    List<Marriage> findByPerson1IdAndPerson2IdOrPerson2IdAndPerson1Id(
        Long person1Id, Long person2Id, Long person2Id2, Long person1Id2);
} 