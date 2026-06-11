const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class BlockchainService {
  constructor() {
    // Usamos el emulador local de Hardhat. En Docker debe apuntar a host.docker.internal
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://host.docker.internal:8545";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Llave privada por defecto de Hardhat (Account #0)
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // ABI Hardcodeado para evitar problemas de rutas fuera del contenedor Docker
    const contractAbi = [
      "function registerEvidence(string memory documentId, string memory docHash) public",
      "function verifyEvidence(string memory documentId) public view returns (string memory, uint256, address)"
    ];
    
    const contractAddress = process.env.EVIDENCE_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    this.contract = new ethers.Contract(contractAddress, contractAbi, this.wallet);
    console.log(`[Blockchain] Conectado al contrato EvidenceRegistry en ${contractAddress} via ${rpcUrl}`);
  }

  /**
   * Registra el Hash de un documento en la Blockchain
   * @param {string} documentId 
   * @param {string} docHash 
   * @returns {Promise<string>} Transaction Hash
   */
  async registrarEvidencia(documentId, docHash) {
    if (!this.contract) {
      throw new Error("El contrato no está inicializado");
    }

    try {
      console.log(`[Blockchain] Registrando evidencia: ${documentId} -> ${docHash}`);
      const tx = await this.contract.registerEvidence(documentId, docHash);
      const receipt = await tx.wait();
      console.log(`[Blockchain] Evidencia registrada! Tx Hash: ${receipt.hash}`);
      return receipt.hash;
    } catch (error) {
      console.error("[Blockchain] Error registrando evidencia:", error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();
