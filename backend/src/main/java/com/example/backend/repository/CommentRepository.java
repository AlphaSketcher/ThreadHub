package com.example.backend.repository;

import com.example.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(Long postId);

    @Modifying
    @Transactional
    @Query("UPDATE Comment c SET c.avatar = :avatar WHERE c.author = :author")
    void updateAvatarByAuthor(@Param("avatar") String avatar, @Param("author") String author);
}
