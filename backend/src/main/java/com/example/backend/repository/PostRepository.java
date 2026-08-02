package com.example.backend.repository;

import com.example.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.avatar = :avatar WHERE p.author = :author")
    void updateAvatarByAuthor(@Param("avatar") String avatar, @Param("author") String author);
}
