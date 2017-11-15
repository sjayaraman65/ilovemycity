create or replace procedure p_db_proc_gateway(i_req_No         IN VARCHAR2,
                                              i_crud_operation In VARCHAR2,
                                              i_proc_name      IN VARCHAR2,
                                              i_request_msg    IN CLOB,
                                              o_result_msg     OUT CLOB,
                                              o_response_msg   OUT CLOB) IS

  procedure p_ins_params(i_req_No         IN VARCHAR2,
                         i_crud_operation In VARCHAR2,
                         i_proc_name      IN VARCHAR2,
                         i_request_msg    IN CLOB,
                         o_result_msg     OUT CLOB)
  
   IS
  BEGIN
    -- 1. persist the incoming parameters
    o_result_msg := to_clob('result : "SUCCESS"};');
    insert into t1
      (req_no,
       crud_operation,
       proc_name,
       request_msg,
       result_status,
       response_msg)
    values
      (i_req_No,
       i_crud_operation,
       i_proc_name,
       i_request_msg,
       o_result_msg,
       empty_clob());
    commit;
  exception
    when others then
      -- validation failed
      dbms_output.put_line(sqlerrm);
      rollback;
  END; -- p_ins_params

  procedure p_check_params IS
  BEGIN
    -- 2. perform all the possible validation
    null;
  END p_check_params;

  procedure p_execute_procedure(i_req_No         IN VARCHAR2,
                                i_crud_operation In VARCHAR2,
                                i_proc_name      IN VARCHAR2,
                                i_request_msg    IN CLOB,
                                o_result_msg     OUT CLOB) IS
    v_dbObjType VARCHAR2(50);
    v_dbParams  CLOB := empty_Clob();
    v_exeQuery  VARCHAR2(32567);
  
  BEGIN
    --  3. execute the proc_name with the incoming request message and get the response from the oracle procedure.
  
    select JSON_QUERY(i_request_msg, '$.dbParams') DbParams
      into v_DbParams
      from DUAL;
  
    --    v_exeQuery := 'begin ' || i_Proc_Name || ' (:bindVar) ;   end;';
    v_exeQuery := 'begin ' || i_Proc_Name || ' ;   end;';
    dbms_output.put_line(v_exeQuery);
    dbms_output.put_line(v_DbParams);
    execute immediate v_exeQuery;
    --using v_DbParams;
  exception
    when others then
      dbms_output.put_line(sqlerrm);
  END; -- p_execute_procedure
BEGIN
  /* main logic 
  1. persist the incoming parameters
  2. perform all the possible validation
     a. validate the crud_operation
     b. validate the availability of proc_name against the Oracle stored procedure, package procedure or function
     c. validate the standardness of the incoming request message
  3. execute the proc_name with the incoming request message and get the response from the oracle procedure.
  4. Frame the outgoing messages (a. result_msg with SUCCESS or FAILURE message, b. response message from the prev. step)
  5. Return back to JSComponent
  */
  o_result_msg   := to_clob('{"result" :"SUCCESS" }');
  o_response_msg := to_clob('Req_no=' || i_req_no);
  dbms_output.put_line('i_request =>' || i_req_No);

  p_ins_params(i_req_No,
               i_crud_operation,
               i_proc_name,
               i_request_msg,
               o_result_msg);
  p_check_params;
  p_execute_procedure(i_req_No,
                      i_crud_operation,
                      i_proc_name,
                      i_request_msg,
                      o_result_msg);

exception
  when others then
    -- validation failed
    dbms_output.put_line(sqlerrm);
    rollback;
END p_db_proc_gateway;
/
