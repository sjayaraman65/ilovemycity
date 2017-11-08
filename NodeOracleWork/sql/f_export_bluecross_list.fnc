create or replace function f_export_bluecross_list(i_term_code in VARCHAR2)
  return VARCHAR2 AS
  v_result     VARCHAR2(10) := null;
  v_result_msg VARCHAR2(5000) := null;
begin
  -- Call the procedure
  p_export_bluecross_list(i_term_code  => i_term_code,
                          o_result     => v_result,
                          o_result_msg => v_result_msg);
  return trim(v_result) || ' - ' || trim(v_result_msg);
end;
/
