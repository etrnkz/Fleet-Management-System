  uuid_etev4     NOT NULLdesiption" charactr vrying,
        "isAciv"    boolean NOT NULL DEFAULT true,
        "heaId"      uuid,
        "created    UQ_colleges_code" UNIQUE ("code"),
        CONSTRAINT "  uuid_etev4     NOT NULLdesriptin" character varying,
        "isActive"    booean NOT NULL DEFAULT true,
        "col  headId"      uuid,
        "    UQ_codeUNQUcoePPMARYuuid_etev4mailpsswordnme    profleImage"     text,
        "iUQ_emailUNIQUE("email"),
   CONSTRAINT "K_users" P)
  `);

    // Add FKs for colleges.headId and departments.headId/collegeId now that users exists
    await queryRunner.query(`ALTER TABLE "colleges"    ADD FKcolleges_head"       FOREIGN KEY ("headId")    REFERENCES ""("id")       ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FKdpartents_college"  FOREIGN KEY ("collegeId") REFERENCES "colleges"("id")    ON DELETE SET NULL`);
    awt queryRunner.query(`ALTER TABLE "departments ADDCONSTRAIT "FK_departments_head"     FOREGN KYhdId")    REFERENCES "users"("d)       ON DELETE SET NULL`;    await queryRunner.query(`ALTER TABLE "users"ADD    `);    await queryRunner.query(`ALTER TABLE "users"ADD          vehicles (no FKtodriers yt — cruar dep rolved afterdrivers)uuid_etev4(),
        CONSTRAINT "UQ_vehicles_plateNumber" UNIQUE "plateNumber"uuid_etev4(),
        CONSTRAINT "UQ_drivers_userId"        UNIQUE ("userId"),
        CONSTRAINT "UQ_drivers_licenseNumber" UNIQUE "licenseNumber"     Id Nowa  uuid_etev4                                                (),
        CONSTRAINT "UQ_trip_requests_requestNumber" UNIQUE "requestNumber"                           uuid_etev4uuid_etev4 UNIQUE NOT NULLjsonuuid_etev4locaions_tuuid_etev4(),
        "reqestNmber"    character varyng NOT NULLubmitSubmittd',
        "ispectionNotes"  text,
        "inspecteById"    uud,
        "ispectedAt"      TIMESTAMPapprvdByIduuppovtionNostextcompl(),
        CONSTRAINT "UQ_maintenance_requestNumber" UNIQUE "requestNumber" submittedBy"  FOREIGN KEY ("submittedById") REFERENCES "uses"("id")   ON DELETE SET NULL,
        CONSTRAINT "FK_maintnanc_inpec inspectdById") REFERENCES "sr"("id")   ON DELETE SET NULL,
        CONSTRAINT "FK_mainenance_approvedBy"   FOREIGN KEY ("approv uuid_etev4      character varying NOT NULL,
 "trpI"         character varying charactervaryingNOT NULL,
        "type"           character varyng NOT NULL1010mileageAtRe" integr,
        "stationrcipNmbr charactr vaynguuid_etev4 uuid_etev4 oType  NOT NULL    characr varyingdcription 
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entityType_entityId" ON "audit_logs"("entityType","entityId")`);    awaitqueryRunner.query(`CREATEINDEX"IDX_audit_logs_userId_createdAt"  ON"audit_logs"("userId","createdAt"`);await queryRunner.query(CREATE INDEX "IDX_audit_logs_action_createdAt"    ON "audit_logs"("action","createdAt"`)urationurationuuid_etev4ripTypcharacr varyinge,
        "steps"     txt NOT NULLurationuration