const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function test() {
  console.log("=== INICIANDO PRUEBA DE BLOCKCHAIN (HARDHAT NODO LOCAL) ===");
  
  const rpcUrl = "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  // Default Account 0 in Hardhat
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(privateKey, provider);

  const abiPath = path.resolve(__dirname, "../../../blockchain/artifacts/contracts/EvidenceRegistry.sol/EvidenceRegistry.json");
  if (!fs.existsSync(abiPath)) {
    console.error("❌ No se encontró el archivo compilado del contrato. Debes compilarlo en la carpeta blockchain.");
    return;
  }

  const contractJson = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
  
  console.log("1️⃣ Desplegando el contrato EvidenceRegistry.sol en tu nodo local...");
  const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log(`✅ Contrato desplegado con éxito! Dirección: ${address}`);
  console.log("-----------------------------------------------------");

  console.log("2️⃣ Simulando el registro de la evidencia (Sello Notarial)...");
  const documentId = "FOTO-HURTO-" + Math.floor(Math.random() * 10000);
  const docHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  console.log(`- Documento ID: ${documentId}`);
  console.log(`- Huella (Hash): ${docHash}`);

  try {
    const tx = await contract.registerEvidence(documentId, docHash);
    const receipt = await tx.wait();
    console.log("-----------------------------------------------------");
    console.log("✅ ¡EXITO TOTAL! La evidencia ha sido registrada criptográficamente.");
    console.log(`🔍 Tu comprobante público (Tx Hash) es: \n${receipt.hash}`);
    console.log("=====================================================");
  } catch (err) {
    console.error("❌ Falló el registro:", err);
  }
}

test();
