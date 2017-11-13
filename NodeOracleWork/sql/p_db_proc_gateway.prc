create or replace procedure p_db_proc_gateway(i_req_No         IN VARCHAR2,
                                              i_crud_operation In VARCHAR2,
                                              i_proc_name      IN VARCHAR2,
                                              i_request_msg    IN CLOB,
                                              o_result_msg     OUT CLOB,
                                              o_response_msg   OUT CLOB) IS

  v_dbObjType VARCHAR2(50);
  v_dbParams  CLOB := empty_Clob();
  v_exeQuery  VARCHAR2(32567);
  v_switch    PLS_INTEGER := 1;
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

  /*  begin
  if v_switch = 0 then
    begin
      insert into t (reqNo, a) values (i_reqNo, i_request_msg);
      dbms_output.put_Line('valid json ');
      commit;
      v_switch := 1;
    exception
      when others then
        -- validation failed
        dbms_output.put_line(sqlerrm);
        v_switch := 0;
        rollback;
    end;
  else
    begin
      select JSON_VALUE(a, '$.dbObjType') ObjectType,
             JSON_QUERY(a, '$.dbParams') DbParams
        into v_dbObjType, v_DbParams
        from T t
       where T.reqNo = i_reqNo
         and rownum = 1;
    exception
      when others then
        dbms_output.put_line(sqlerrm);
    end;
  end if;
  
  v_exeQuery := 'begin ' || i_Proc_Name || ' (:bindVar) ;   end;';
  dbms_output.put_line(v_exeQuery);
  dbms_output.put_line(v_DbParams);
   execute immediate v_exeQuery
  using v_DbParams; */
exception
  when others then
    -- validation failed
    dbms_output.put_line(sqlerrm);
    rollback;
END p_db_proc_gateway;
/
