create or replace procedure p_db_proc_gateway(i_reqNo    IN NUMBER,
                                              i_request  IN CLOB,
                                              o_response OUT CLOB,
                                              o_result   OUT CLOB) IS

  v_dbObjType VARCHAR2(50);
  v_dbObjName VARCHAR2(100);
  v_dbParams  CLOB := empty_Clob();
  v_exeQuery  VARCHAR2(32567);
  v_switch    PLS_INTEGER := 0;
BEGIN
  dbms_output.put_line('i_request =>' || i_reqNo);
  begin
    begin
      insert into t (reqNo, a) values (i_reqNo, i_request);
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
    if v_switch = 1 then
      begin
        select JSON_VALUE(a, '$.dbObjType') ObjectType,
               JSON_VALUE(a, '$.dbObjName') ObjectName,
               JSON_QUERY(a, '$.dbParams') DbParams
          into v_dbObjType, v_dbObjName, v_DbParams
          from T t
         where T.reqNo = i_reqNo;
      exception
        when others then
          dbms_ouput.put_line(sqlerrm);
      end;
    end if;
  
    v_exeQuery := 'begin ' || v_dbObjName || ' (:bindVar) ;   end;';
    dbms_output.put_line(v_exeQuery);
    dbms_output.put_line(v_DbParams);
    execute immediate v_exeQuery
      using v_DbParams;
  
  exception
    when others then
      -- validation failed 
      dbms_output.put_line(sqlerrm);
      rollback;
  end;
END p_db_proc_gateway;
/
