import { LoginScreen } from "@/screen";
import { WrapperStack } from "@/components/wrapper-stack";

export default function Login() {
  return (
    <WrapperStack withBackButton>
      <LoginScreen />
    </WrapperStack>
  );
}
