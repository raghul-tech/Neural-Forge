class NeuralNetwork {
    constructor() {
        this.neurons = [];
        this.connections = [];
        this.learningRate = 0.75;
        this.generation = 0;
        this.fitness = 0;
    }
    
    addNeuron(type, x, y) {
        const neuron = {
            id: Date.now() + Math.random(),
            type: type,
            x: x,
            y: y,
            value: 0,
            bias: Math.random() * 0.5,
            loopCreated: window.game ? window.game.currentLoop : 1,
            weight: 1.0
        };
        this.neurons.push(neuron);
        return neuron;
    }
    
    addConnection(fromId, toId, weight = null) {
        const connection = {
            from: fromId,
            to: toId,
            weight: weight !== null ? weight : Math.random() * 2 - 1,
            enabled: true
        };
        this.connections.push(connection);
        return connection;
    }
    
    forwardPropagate(input) {
        this.neurons.forEach(n => n.value = 0);
        
        const sensors = this.neurons.filter(n => n.type === 'sensor');
        sensors.forEach((sensor, i) => {
            sensor.value = input[i % input.length];
        });
        
        for (let pass = 0; pass < 5; pass++) {
            this.connections.forEach(conn => {
                if (!conn.enabled) return;
                const fromNeuron = this.neurons.find(n => n.id === conn.from);
                const toNeuron = this.neurons.find(n => n.id === conn.to);
                if (fromNeuron && toNeuron) {
                    toNeuron.value += fromNeuron.value * conn.weight;
                }
            });
        }
        
        this.neurons.forEach(neuron => {
            if (neuron.type === 'processor') {
                neuron.value = 1 / (1 + Math.exp(-(neuron.value + neuron.bias)));
            } else if (neuron.type === 'memory') {
                neuron.value = Math.tanh(neuron.value);
            } else {
                neuron.value = Math.max(0, Math.min(1, neuron.value));
            }
        });
        
        const actuators = this.neurons.filter(n => n.type === 'actuator');
        const output = actuators.reduce((sum, a) => sum + a.value, 0) / (actuators.length || 1);
        return output;
    }
    
    train(reward) {
        this.fitness += reward;
        
        this.connections.forEach(conn => {
            const fromNeuron = this.neurons.find(n => n.id === conn.from);
            const toNeuron = this.neurons.find(n => n.id === conn.to);
            if (fromNeuron && toNeuron && conn.enabled) {
                const delta = this.learningRate * fromNeuron.value * toNeuron.value * reward;
                conn.weight += delta;
                conn.weight = Math.max(-2, Math.min(2, conn.weight));
            }
        });
        
        this.neurons.forEach(neuron => {
            if (neuron.type === 'processor' || neuron.type === 'memory') {
                neuron.bias += this.learningRate * reward * 0.1;
                neuron.bias = Math.max(-1, Math.min(1, neuron.bias));
            }
        });
        
        if (Math.random() < 0.1) this.mutate();
    }
    
    mutate() {
        if (this.connections.length > 0 && Math.random() < 0.3) {
            const randomConn = this.connections[Math.floor(Math.random() * this.connections.length)];
            randomConn.weight += (Math.random() - 0.5) * 0.5;
            randomConn.weight = Math.max(-2, Math.min(2, randomConn.weight));
        }
        
        this.neurons.forEach(neuron => {
            if (Math.random() < 0.1) {
                neuron.bias += (Math.random() - 0.5) * 0.1;
            }
        });
    }
    
    serialize() {
        return {
            neurons: this.neurons,
            connections: this.connections,
            learningRate: this.learningRate,
            generation: this.generation,
            fitness: this.fitness
        };
    }
    
    deserialize(data) {
        this.neurons = data.neurons;
        this.connections = data.connections;
        this.learningRate = data.learningRate;
        this.generation = data.generation;
        this.fitness = data.fitness;
    }
    
    clear() {
        this.neurons = [];
        this.connections = [];
        this.generation = 0;
        this.fitness = 0;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeuralNetwork;
}