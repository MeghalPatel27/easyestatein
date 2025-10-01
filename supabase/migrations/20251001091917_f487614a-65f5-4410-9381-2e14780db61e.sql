-- Create triggers to keep property_matches fresh and enable dynamic updates

-- Properties: refresh matches on insert/update
DROP TRIGGER IF EXISTS trg_property_change ON public.properties;
CREATE TRIGGER trg_property_change
AFTER INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.handle_property_change();

-- Requirements: refresh matches for all brokers on insert/update
DROP TRIGGER IF EXISTS trg_requirement_change ON public.requirements;
CREATE TRIGGER trg_requirement_change
AFTER INSERT OR UPDATE ON public.requirements
FOR EACH ROW EXECUTE FUNCTION public.handle_requirement_change();

-- Cleanup on delete
DROP TRIGGER IF EXISTS trg_property_deleted ON public.properties;
CREATE TRIGGER trg_property_deleted
AFTER DELETE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.handle_property_deletion();

DROP TRIGGER IF EXISTS trg_requirement_deleted ON public.requirements;
CREATE TRIGGER trg_requirement_deleted
AFTER DELETE ON public.requirements
FOR EACH ROW EXECUTE FUNCTION public.handle_requirement_deletion();

-- Keep properties in sync with approvals
DROP TRIGGER IF EXISTS trg_property_approval_upsert ON public.property_approvals;
CREATE TRIGGER trg_property_approval_upsert
AFTER INSERT OR UPDATE ON public.property_approvals
FOR EACH ROW EXECUTE FUNCTION public.create_or_update_property_on_approval();

DROP TRIGGER IF EXISTS trg_property_approval_delete ON public.property_approvals;
CREATE TRIGGER trg_property_approval_delete
AFTER DELETE ON public.property_approvals
FOR EACH ROW EXECUTE FUNCTION public.handle_property_approval_deletion();

DROP TRIGGER IF EXISTS trg_property_approval_sync ON public.property_approvals;
CREATE TRIGGER trg_property_approval_sync
AFTER UPDATE ON public.property_approvals
FOR EACH ROW EXECUTE FUNCTION public.sync_property_approval_updates();

-- Backfill: generate matches for existing active brokers
DO $$
DECLARE b RECORD;
BEGIN
  FOR b IN SELECT DISTINCT broker_id FROM public.properties WHERE status = 'active' LOOP
    PERFORM public.refresh_broker_property_matches(b.broker_id);
  END LOOP;
END $$;