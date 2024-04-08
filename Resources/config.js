import dotEnv from 'dotenv'

dotEnv.config();

export default class Config{
    SERVER_HOSTNAME = process.env.SERVER_HOSTNAME;
    SERVER_PORT = process.env.SERVER_PORT
    URL = `http://${this.SERVER_HOSTNAME}:${this.SERVER_PORT}`
}
