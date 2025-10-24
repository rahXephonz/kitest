import { EventDetailsScreen } from "@/screen";
import { WrapperStack } from "@/components/wrapper-stack";

export default function EventDetail() {
  return (
    <WrapperStack withBackButton disableScrollView={false}>
      <EventDetailsScreen />
    </WrapperStack>
  );
}
