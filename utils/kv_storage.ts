import { Redis } from "npm:ioredis";

class KvStorage {
  private redisClient: Redis | null = null;

  init() {
    this.redisClient = new Redis({
      host: "localhost", // Replace with your Redis hostname if needed
      port: 6379, // Replace with your Redis port if needed
      password: 'mypassword'
    });
  }

  private async getClient(): Promise<Redis> {
    if (!this.redisClient) {
      await this.init();
    }
    return this.redisClient!;
  }

  async get(key: string): Promise<any | undefined> {
    const client = await this.getClient();
    try {
      const result = await client.get(key);
      return result ? JSON.parse(result) : undefined;
    } catch (error) {
      console.error(`Error getting key ${key} from Redis:`, error);
      return undefined;
    }
  }

  async set(key: string, value: any): Promise<void> {
    const client = await this.getClient();
    try {
      await client.set(key, JSON.stringify(value)); // Store data as JSON string
    } catch (error) {
      console.error(`Error setting key ${key} in Redis:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    const client = await this.getClient();
    try {
      await client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key} from Redis:`, error);
    }
  }

  async read(): Promise<any | null> {
    return this.get("savedGames");
  }

  async write(data: any): Promise<void> {
    await this.set("savedGames", data);
  }
}

export default KvStorage;
