create or replace procedure p_get_blueCross_file(i_params IN clob)
is
 v_result CLOB := to_clob(i_params);
begin
  dbms_output.put_line('aaaaaaaaaaaaaasssssssssssssss aaaaaaaaaaaaaaaaaa ssssssssssssssssssss =>'||i_params);
  dbms_output.put_line(v_result);
  return;
end;   
   
   
