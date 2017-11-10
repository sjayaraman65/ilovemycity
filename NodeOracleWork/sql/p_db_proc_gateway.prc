create or replace procedure p_db_proc_gateway(i_reqNo        IN VARCHAR2,
                                              i_proc_name    IN VARCHAR2,
                                              i_request_msg  IN CLOB,
                                              o_result_msg   OUT CLOB,
                                              o_response_msg OUT CLOB) IS

  v_dbObjType VARCHAR2(50);
  v_dbParams  CLOB := empty_Clob();
  v_exeQuery  VARCHAR2(32567);
  v_switch    PLS_INTEGER := 1;
BEGIN
  o_response_msg := to_clob('Test Results');
  o_result_msg   := to_clob('SUCCESS');
  dbms_output.put_line('i_request =>' || i_reqNo);
  begin
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
    /* execute immediate v_exeQuery
    using v_DbParams; */
  exception
    when others then
      -- validation failed
      dbms_output.put_line(sqlerrm);
      rollback;
  end;
END p_db_proc_gateway;
/
