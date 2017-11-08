rem PL/SQL Developer Test Script

set feedback off
set autoprint off

rem Declare variables
variable o_response clob
variable o_result clob

rem Execute PL/SQL Block
begin
  -- Call the procedure
  p_db_proc_gateway(i_reqno => 3,
                    i_request => to_clob('{"dbProcName":"p_export_bluecross_list"
                                 ,"dbParams":[{"colName":"termcode","colType":"C","Value":"201705"}
                                            , {"colName":"snapShotType","colType":"C","Value":"CAAT1"}]  
                                 }'),
                    o_response => :o_response,
                    o_result => :o_result);
end;
/

rem Print variables
print o_response
print o_result
