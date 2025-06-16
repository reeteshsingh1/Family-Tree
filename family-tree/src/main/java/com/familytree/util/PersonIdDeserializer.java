package com.familytree.util;

import com.familytree.model.Person;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;

public class PersonIdDeserializer extends JsonDeserializer<Person> {

    @Override
    public Person deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException {
        JsonNode node = jp.getCodec().readTree(jp);
        
        // Handle null case
        if (node.isNull()) {
            return null;
        }
        
        // Handle case where node is an object with an id field
        if (node.isObject() && node.has("id")) {
            Long id = node.get("id").asLong();
            Person person = new Person();
            person.setId(id);
            return person;
        }
        
        // Handle case where node is just a number (id)
        if (node.isNumber()) {
            Long id = node.asLong();
            Person person = new Person();
            person.setId(id);
            return person;
        }
        
        // If we can't handle the input, return null
        return null;
    }
} 