package com.springboot.MyTodoList.repository;


import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.springboot.MyTodoList.model.ToDoItem;

@Repository
@Transactional
@EnableTransactionManagement
public interface ToDoItemRepository extends JpaRepository<ToDoItem,Integer> {

    List<ToDoItem> findBySprintIdAndStatus(Long sprintId, String status);

    List<ToDoItem> findBySprintIdAndStatusAndAssignee(Long sprintId, String status, Long assigneeId);

}
