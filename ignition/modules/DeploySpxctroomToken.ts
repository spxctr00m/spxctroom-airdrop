import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SpxctroomModule = buildModule("SpxctroomModule", (m) => {
  const recipient = "0x3f79824989897Fb20b24ee4373041dE5dc9885eE";
  const initialOwner = "0x3f79824989897Fb20b24ee4373041dE5dc9885eE";

  const token = m.contract("Spxctroom", [recipient, initialOwner]);

  return { token };
});

export default SpxctroomModule;