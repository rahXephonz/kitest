import { CreateEventScreen } from "@/screen";
import { WrapperStack } from "@/components/wrapper-stack";

export default function CreateEvent() {
  return (
    <WrapperStack withBackButton>
      <CreateEventScreen />
    </WrapperStack>
  );
}
