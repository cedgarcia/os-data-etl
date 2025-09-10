/**
 * THIS DATA ARE FROM THE CONTRIBUTORS TABLE
 */

// COMMENTS IN HERE IS AS FOLLOWS (firstname | lastname | status | updated | createdDate *** bio ) ****** QUERY is -- select distinct contributorid from contents_contributor
let contributorID = {
  69: '', //  Reuters | News Agency | NULL | NULL | 2020-02-27 22:31:33.0000000 *** Contributors
  92: '', // Neil Jayson | Servallos | NULL | NULL | 2020-08-17 23:24:55.0000000 *** Contributor
  232: '', // OneSports. | PH | Active | NULL | 2022-11-28 16:44:23.0000000 *** OneSports.PH - Contributor
  15: '', // Jose Rodel | Clapano | Active | NULL | 2019-07-18 15:43:50.0000000 *** Jose Rodel  Clapano - Contributor
  252: '', // Bella | Cariaso | NULL | NULL | 2023-03-13 05:00:35.0000000 *** Contributor
  295: '', // Thony Rose | Lesaca | NULL | NULL | 2025-01-16 20:59:05.0000000 *** Contributor
  26: '', // Helen | Flores | Active | NULL | 2019-08-07 10:02:41.0000000 *** -
  106: '', // Louella | Desiderio | NULL | NULL | 2020-11-26 00:06:18.0000000 *** Contributor
  6: '', // Romina Marie | Cabrera | Active | 2021-11-30 21:10:44.0000000 | 2019-07-06 16:43:41.0000000 *** Romina Cabrera - Contributor
  49: '', // Ghio | Ong | NULL | NULL | 2019-11-05 23:17:55.0000000 *** Contributor
  298: '', // Nicole | Pineda | NULL | NULL | 2025-01-16 20:59:57.0000000 *** Contributor
  259: '', // Daphne | Galvez | NULL | NULL | 2023-06-25 02:42:01.0000000 *** Contributor, The Philippine Star
  250: '', // Mark Ernest | Villeza
  64: '',
  256: '',
  293: '',
  1: '',
  70: '',
  93: '',
  30: '',
  10: '',
  133: '',
  61: '',
  90: '',
  290: '',
  4: '',
  147: '',
  296: '',
  19: '',
  179: '',
  5: '',
  116: '',
  39: '',
  45: '',
  294: '',
  286: '',
  117: '',
  280: '',
  31: '',
  297: '',
  97: '',
  237: '',
  37: '',
  8: '',
}

/**
 * 
--select distinct author from contents
--select distinct creator from contents_vertical

--select * from contents
--select DISTINCT CREATOR, firstname from contributor



--select * from contents where id =26923  --1399 results
--select * from contents_contributor  -- 1380 results

--select * from sponsor	



--select * from vertical
--select distinct creator from contents -- ito yung parang sa lahat na ng contents
--select distinct creator from contents_vertical -- ito yung mga contents_Vertical/ contents ng one sports



--select * from contents where creator = 'c6e86cc7-bbf4-45de-ba4b-0e27da2d65d1' -- 1. Inna Mina  *****
--select * from contents where creator = 'defe4a2f-2020-4371-a787-a62b94a71ff9' -- 2. Pao Ambat / one  sports  *****
--select * from contents where creator = '5488e63a-89b6-491f-8abf-af613cea1cf4' -- 3. jan ballesteros / one sports  // Gillian trinidad *****
--select * from contents where creator = '37b0d9fb-3fdc-428c-95f1-ec66b8499565' -- 4. Kiko Demigillo / one sports  *****
--select * from contents where creator = 'fbc1ba88-4778-49df-a3d2-94096f0fdaa2' -- 5. luisa morales / one sports // Kiko Demigillo  *****
--select * from contents where creator = 'e17869bd-f1a0-4943-b555-f90fcdcb2ff9' -- 6. katrina alba / one sports //gillian trinidad / Paolo del Rosario / Kiko Demigillo / Aivan Episcope   ***** 
--select * from contents where creator = '800f2f08-4cbf-46ec-84cd-8bb0e2c3963d' -- 7. jan ballesteros / one sports *****
--select * from contents where creator = '984f08aa-cbe9-42fe-b5ef-b4456f143a47' -- 8. one sports *****

-- not onesports
--select * from contents where creator = 'd8a50be0-bece-4ba0-b17e-a377a984afef' -- 9. null
--select * from contents where creator = '979d90ad-0d68-400a-b295-0e2be53e1763' -- 10. null
--select * from contents where creator = '5b3c8e28-e6d1-4894-9971-5ae6b0c30025' -- 11. null
--select * from contents where creator = '2de1eca8-12f4-450b-b10e-5ab2765c6d08' -- 12. null




--select * FROM contents_contributor where creator = 'c6e86cc7-bbf4-45de-ba4b-0e27da2d65d1' --1.inna mina | contributor id = 232
--select * FROM contents_contributor where creator = 'defe4a2f-2020-4371-a787-a62b94a71ff9' --2.paolo ambat | contributor id = 232
--select * FROM contents_contributor where creator = '5488e63a-89b6-491f-8abf-af613cea1cf4' --3.jan ballesteros | contributor id = 232
--select * FROM contents_contributor where creator = '37b0d9fb-3fdc-428c-95f1-ec66b8499565' --4.kiko demigillo | contributor id = 232
--select * FROM contents_contributor where creator = 'fbc1ba88-4778-49df-a3d2-94096f0fdaa2' --5.luisa morales | contributor id = 232
--select * FROM contents_contributor where creator = 'e17869bd-f1a0-4943-b555-f90fcdcb2ff9' --6.katrina alba| contributor id = 232
--select * FROM contents_contributor where creator = '800f2f08-4cbf-46ec-84cd-8bb0e2c3963d' --7.jan ballesteros| contributor id = 232
--select * FROM contents_contributor where creator = '984f08aa-cbe9-42fe-b5ef-b4456f143a47' --8.one sports| contributor id = 232

-- not onesports
--select * FROM contents_contributor where creator = 'd8a50be0-bece-4ba0-b17e-a377a984afef' --9.null | contributor id = 45, 39
--select * FROM contents_contributor where creator = '979d90ad-0d68-400a-b295-0e2be53e1763' --10.null | contributor id = 45
--select distinct contributorid FROM contents_contributor where creator = '5b3c8e28-e6d1-4894-9971-5ae6b0c30025' --11.null | contributor id = 1,4,5,6,8,15,19,26,30,31,37,49,70,93,116,117,133,250,252,256,259,280,290,293,295,296,297,298
--select distinct contributorid FROM contents_contributor where creator = '2de1eca8-12f4-450b-b10e-5ab2765c6d08' --12`.null | contributor id = 4,5,6,8,10,15,19,26,30,31,37,39,45,49,61,64,69,70,90,92,97,106,147,179,237,250,252,256,259,286,290,294




--select distinct contributorid from contents_contributor

 
 





-- ONE NEWS
--select * FROM contents_contributor where creator = 'd8a50be0-bece-4ba0-b17e-a377a984afef' -- contributor id 45 
--select * from contributor where id = '45' -- ONE NEWS PH

--select * FROM contents_contributor where creator = '979d90ad-0d68-400a-b295-0e2be53e1763' -- contributor id 45 








-- LUISA MORALES
--select * FROM contents_contributor where creator = 'fbc1ba88-4778-49df-a3d2-94096f0fdaa2' -- id 232 luisa
--select * from contributor where id = '232'




 */
