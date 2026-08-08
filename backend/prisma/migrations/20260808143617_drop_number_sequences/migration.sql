-- DropTable: invoice/project numbers are now random tokens, not a running
-- counter, so these sequence tables are no longer needed.
DROP TABLE "InvoiceSequence";
DROP TABLE "ProjectSequence";
