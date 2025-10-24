import { useState } from "react";
import { useRouter } from "expo-router";
import { Button, TextInput, View } from "react-native";

import { Text } from "@/components/ui";
import { useAuth } from "@/hooks/useModule";

export const LoginScreen = () => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const router = useRouter();

  const handleSubmit = () => {
    if (isRegisterMode) {
      register({ password, username });
    } else {
      const resLogin = login({ password, username });
      if (resLogin) router.push("/");
    }
  };

  return (
    <View>
      <Text>{isRegisterMode ? "Register" : "Login"}</Text>
      <TextInput className="py-4" placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput className="py-4" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title={isRegisterMode ? "Register" : "Login"} onPress={handleSubmit} />
      <Button
        title={isRegisterMode ? "Switch to Login" : "Switch to Register"}
        onPress={() => setIsRegisterMode(!isRegisterMode)}
      />
    </View>
  );
};
