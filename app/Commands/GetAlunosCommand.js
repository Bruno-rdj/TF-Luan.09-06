import axios from "axios";
import CliTable3 from "cli-table3";

export default {

    name: 'get-alunos',
    description: 'obter alunos',
    arguments: {
        seconds: "number",
        host: "string"
    },

    handle: async function (args) {
        // Use o host fornecido como argumento ou o padrão para Docker
        const baseUrl = args.host ? `http://${args.host}` : 'http://nginx-aula-14-tf-container';
        
        const data = new URLSearchParams();
        data.append('email', 'user1@example.com');
        data.append('senha', '123456');

        try {
            const response = await axios.post(`${baseUrl}/login`, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const tokenData = response.data;

            console.log('Token obtido:', tokenData.token);

            let limit = 10;
            let offset = 0;
            let hasMore = true;
            
            const table = new CliTable3({
                head: ['Nome', 'Materias'],
                colWidths: [20, 50]
            });

            while (hasMore) {
                const alunosResponse = await axios.get(`${baseUrl}/api/alunos?limit=${limit}&offset=${offset}`, {
                    headers: {
                        'Authorization': `Bearer ${tokenData.token}`
                    }
                });

                const alunosData = alunosResponse.data;
                
                alunosData.rows.forEach(aluno => {
                    const materias = aluno.materias.map(materia => materia.nome).join(', ');
                    table.push([aluno.nome, materias]);
                });

                if (alunosData.next !== null) {
                    offset = alunosData.next;
                } else {
                    hasMore = false;
                }
            }

            console.log(table.toString());
        } catch (error) {
            console.error('Erro na requisição:', error.response?.data || error.message);
            return;
        }
    }
}