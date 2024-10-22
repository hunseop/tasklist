export function loadFirewallTypes(firewallSelect) {
    fetch('/get_firewall_types')
        .then(response => response.json())
        .then(data => {
            data.types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                firewallSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error:', error));
}

export function loadCommands(selectedFirewall, commandSelect) {
    if (selectedFirewall !== 'Select Firewall Type') {
        fetch(`/get_commands/${selectedFirewall}`)
            .then(response => response.json())
            .then(data => {
                commandSelect.innerHTML = '<option selected>Select Command</option>';
                data.commands.forEach(command => {
                    const option = document.createElement('option');
                    option.value = command;
                    option.textContent = command;
                    commandSelect.appendChild(option);
                });
                commandSelect.disabled = false;
            })
            .catch(error => console.error('Error:', error));
    } else {
        commandSelect.innerHTML = '<option selected>Select Command</option>';
        commandSelect.disabled = true;
    }
}
