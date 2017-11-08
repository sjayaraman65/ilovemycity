CREATE OR REPLACE PROCEDURE P_EXPORT_BLUECROSS_LIST(i_term_code  IN VARCHAR2,
                                                    o_result     IN OUT VARCHAR2,
                                                    o_result_msg IN OUT VARCHAR2) as

  -- Purpose: This procedure creates CSV files for Blue Cross
  -- Developed On: 17-July-2017
  -- Developed By: Srini Jayaraman

  s_errror_trace_msg varchar2(5000) := null;
  s_header           varchar2(5000);

  l_csv_content CLOB := EMPTY_CLOB();
  l_utility     VARCHAR2(30) := 'winftp'; -- ftp tool
  l_port        VARCHAR2(30) := '21'; -- port
  l_user_name   VARCHAR2(30) := 'BannerSIS'; -- FTP Usee
  l_password    VARCHAR2(30) := 'banner515'; -- FTP Password

  l_folder_name VARCHAR2(100) := null;
  l_folder_fmt  VARCHAR2(12) := 'YYYY-MM-DD'; -- Date format for folder

  s_filename varchar2(100) := 'exp_blue_cross.dat';

  v_bcross_list_cur SYS_REFCURSOR;

  function f_get_db_name return VARCHAR2 IS
    v_retval v$instance.instance_name%TYPE := null;
  BEGIN
    FOR rec in (SELECT upper(instance_name) db_name
                  FROM v$instance
                 where Rownum = 1) LOOP
      v_retval := rec.db_name;
    END LOOP;
    return v_retval;
  END f_get_db_name;

  Function f_get_root_folder(i_db_name IN v$instance.instance_name%TYPE)
    return VARCHAR2 IS
    v_retval VARCHAR2(100) := NULL;
  BEGIN
    if i_db_name = 'DSRP' then
      v_retval := '/FTPROOT/AISmartR/External/ORBIS/'; -- FTP Folder
    ELSE
      -- dsru/dsrd OR ANY
      v_retval := '/FTPROOT/DevClassList/AISmartR/External/ORBIS/'; -- FTP Folder
    end if;
    return v_retval;
  END f_get_root_folder;

Begin
  l_folder_name := f_get_root_folder(f_get_db_name());

  OPEN v_bcross_list_cur FOR
    SELECT DTL RESULT
      FROM (select 1 NO,
                   '00' || '         ' || '000000' || 'HEADER    ' ||
                   '130394' || 'CENTENNIAL COLLEGE  ' ||
                   to_char(sysdate, 'YYYYMMDD') || '000000' || '4' ||
                   '0000000' || to_char(term_start_date, 'YYYYMMDD') || '3' ||
                   to_char(term_end_date, 'YYYYMMDD') dtl
              from dsd_academic_time
             where term_code = i_term_code
            UNION
            --Blue Cross Detail
            SELECT 2 NO,
                   rpad(substr(person_id, 1, 9), 9) ||
                   rpad(substr(first_name, 1, 20), 20) ||
                   rpad(substr(last_name, 1, 20), 20) ||
                   rpad(substr(nvl(mailing_street_line1, ' '), 1, 22), 22) ||
                   rpad(substr(nvl(mailing_street_line2, ' '), 1, 22), 22) ||
                   rpad(substr(nvl(mailing_street_line3, ' '), 1, 22), 22) ||
                   rpad(substr(nvl(mailing_postal_code, ' '), 1, 7), 7) ||
                   rpad(substr(gender, 1, 1), 1) ||
                   rpad(nvl(substr(date_of_birth, 3, 6), ' '), 6) ||
                   rpad(substr(residency, 1, 1), 1) dtl
              FROM dsa_blue_cross
             WHERE term_code = i_term_code
            UNION
            -- Blue Cross Trailer SQL
            select 3 NO,
                   '99' || '         ' || '999999' || 'TRAILER   ' ||
                   lpad(TO_CHAR(COUNT(0)), 7, '0') || '0000000' || '0000000' ||
                   '0000000' || '0000000' || '0000000' ||
                   lpad(TO_CHAR(COUNT(0) + 2), 7, '0') dtl
              from DSA_BLUE_CROSS
             WHERE term_code = i_term_code)
     Order by No;

  s_errror_trace_msg := 'Header generation';
  s_header           := null;

  s_errror_trace_msg := 'folder name';
  l_csv_content      := ETL_GLOBAL.f_gen_csv(p_query       => v_bcross_list_cur,
                                             p_header_line => null);
  s_errror_trace_msg := 'Error during Orbis List generation - Local File creation';
  ETL_GLOBAL.p_create_local_file('DSI_EXPORT_ORBIS' -- local folder -- temporarily in ORBIS Folder for testing -- SJ 17 July 2017
                                ,
                                 s_filename,
                                 l_csv_content);
  s_errror_trace_msg := 'Remote File creation';
  ETL_GLOBAL.p_create_remote_file(l_utility,
                                  l_port,
                                  l_user_name,
                                  l_password,
                                  l_folder_name,
                                  s_filename,
                                  l_csv_content);

  s_errror_trace_msg := 'Blue Cross List generation completed successfully - ' ||
                        SYSDATE;
  dbms_output.put_line(s_errror_trace_msg);
  o_result     := 'SUCCESS';
  o_result_msg := s_errror_trace_msg;
exception
  when others then
  
    -- 26 July 2013 send email to dsrtech@centennialcollege.ca
    etl_global.p_send_mail('aismartr@centennialcollege.ca',
                           'sjayaraman@centennialcollege.ca',
                           f_get_db_name || ' - ' ||
                           'Error during Blue Cross List generation - ' ||
                           s_errror_trace_msg,
                           Sqlerrm);
    dbms_output.put_line('Sqlerrm ' || Sqlerrm || ' while ' ||
                         s_errror_trace_msg);
    o_result     := 'FAILURE';
    o_result_msg := 'Sqlerrm ' || Sqlerrm || ' while ' ||
                    s_errror_trace_msg;
End P_EXPORT_BLUECROSS_LIST;
/
