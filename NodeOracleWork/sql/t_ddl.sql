truncate table t
drop table t 
/
create table t (reqNo NUMBER
               ,a clob 
                CONSTRAINT chk_valid_json CHECK (A IS JSON)
                CHECK (JSON_EXISTS(a,'$.dbProcName'))
                CHECK (JSON_EXISTS(a,'$.dbParams'))
               );

insert into t values (1,to_clob('{"dbProcName":"p_export_bluecross_list"
                                 ,"dbParams":[{"colName":"termcode","colType":"C","Value":"201705"}
                                            , {"colName":"snapShotType","colType":"C","Value":"CAAT1"}]  
                                 }')
                      );
                      
         
SELECT Obj.ProcName
      ,Param.ColName
      ,Param.ColType
      ,value
  from (select JSON_VALUE(a, '$.dbProcName') ProcName 
          from T t
         where T.reqNo = 1) Obj
       ,JSON_TABLE((select JSON_QUERY(a, '$.dbParams') DbParams
                    from T t
                   where T.reqNo = 1),
                  '$[*]' COLUMNS(ColName PATH '$.colName'
                                ,ColType PATH '$.colType'
                                ,value PATH '$.Value')
                  ) Param
