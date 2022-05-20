import { DockerMuiThemeProvider } from "@docker/docker-mui-theme";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  InputLabel,
  Radio,
  RadioGroup,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import React, { useEffect, useState } from "react";
import "./App.css";
import MenuItem from "@mui/material/MenuItem";

const protocols = [
  {
    value: "https",
    label: "HTTPS",
  },
  {
    value: "http",
    label: "HTTP",
  },
];

const methods = [
  {
    value: "GET",
    label: "GET",
  },
  {
    value: "POST",
    label: "POST",
  },
  {
    value: "PUT",
    label: "PUT",
  },
  {
    value: "PATCH",
    label: "PATCH",
  },
  {
    value: "DELETE",
    label: "DELETE",
  },
  {
    value: "HEAD",
    label: "HEAD",
  },
  {
    value: "OPTIONS",
    label: "OPTIONS",
  },
];

const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

function App() {
  const ddClient = useDockerDesktopClient();
  const [backendInfo, setBackendInfo] = useState("");
  const [res, setRes] = useState("");
  const [running, setRunning] = useState(false);

  const [options, setOptions] = useState({
    target: "",
    protocol: "http",
    method: "GET",
    duration: 10,
    request_count: 100,
    load_type: "linear",
  });

  useEffect(() => {
    if (res !== "") {
      let prevBackendInfo = backendInfo;
      if (res.includes("Initializing")) {
        // New test, clear output
        prevBackendInfo = "";
      }
      setBackendInfo(prevBackendInfo + res);
    }
  }, [res]);

  useEffect(() => {
    if (running) {
      ddClient.extension.vm.cli.exec(
        "./ddosify",
        [
          "-t",
          options.target,
          "-n",
          options.request_count,
          "-d",
          options.duration,
          "-p",
          options.protocol,
          "-m",
          options.method,
          "-l",
          options.load_type,
        ],
        {
          stream: {
            onOutput(data) {
              if (data?.stdout) {
                let tmp = res + clearEmoji(data.stdout);
                setRes(() => tmp);
              } else {
                console.log(data.stderr);
              }
            },
            onError(error) {
              setRunning(false);
              console.error(error);
            },
            onClose(exitCode) {
              setRunning(false);
              console.log("onClose with exit code " + exitCode);
            },
          },
        }
      );
    } else {
      setRes("");
    }
  }, [running]);

  const stopDdosify = async () => {
    ddClient.extension.vm.cli.exec("killall", ["-SIGINT", "ddosify"]);
  };

  const clearEmoji = (str) => {
    return str
      .replace("â\x9A\x99ï¸\x8F  ", "⚙️ ")
      .replace("ð\x9F\x94¥ ", "🔥 ")
      .replace("ð\x9F\x9B\x91 ", "")
      .replace("â\x9C\x94ï¸\x8F  ", "✅ ")
      .replace("â\x9D\x8C ", "❌ ")
      .replace("â\x8F±ï¸\x8F  ", "⏱️ ")
      .replace("CTRL+C to gracefully stop.", "");
  };
  

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <div className="App">
        <Grid
          container
          columnSpacing={{ xs: 1 }}
          rowSpacing={4}
          style={{ marginTop: "2rem", padding: "4rem" }}
        >
          <Grid container item>
            <Grid item xs={1}>
              <TextField
                style={{ width: "100%", textAlign: "left" }}
                select
                value={options?.method}
                onChange={(e) =>
                  setOptions((prevState) => ({
                    ...prevState,
                    method: e.target.value,
                  }))
                }
                // helperText="Method"
              >
                {methods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={0.2}></Grid>
            <Grid item xs={10.8} container>
              <Grid item xs={1}>
                <TextField
                  style={{ width: "100%", textAlign: "left" }}
                  select
                  value={options?.protocol}
                  onChange={(e) =>
                    setOptions((prevState) => ({
                      ...prevState,
                      protocol: e.target.value,
                    }))
                  }
                  // helperText="Protocol"
                >
                  {protocols.map((protocol) => (
                    <MenuItem key={protocol.value} value={protocol.value}>
                      {protocol.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={11}>
                <TextField
                  error={options?.target === ""}
                  style={{ width: "100%" }}
                  required
                  variant="filled"
                  placeholder="example.com"
                  // helperText="Target URL"
                  label="Target URL"
                  value={options?.target}
                  onChange={(e) =>
                    setOptions((prevState) => ({
                      ...prevState,
                      target: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item container columnSpacing={{ xs: 2 }}>
            <Grid item>
              <TextField
                error={options?.request_count === ""}
                required
                variant="filled"
                label="Request Count"
                type="number"
                value={options?.request_count}
                onChange={(e) =>
                  setOptions((prevState) => ({
                    ...prevState,
                    request_count: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item>
              <TextField
                error={options?.duration === ""}
                required
                variant="filled"
                label="Duration (s)"
                type="number"
                value={options?.duration}
                onChange={(e) =>
                  setOptions((prevState) => ({
                    ...prevState,
                    duration: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item>
              <FormControl>
                <FormLabel style={{ textAlign: "left" }} required>
                  Load Type
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={options?.load_type}
                  onChange={(e) =>
                    setOptions((prevState) => ({
                      ...prevState,
                      load_type: e.target.value,
                    }))
                  }
                >
                  <FormControlLabel
                    value="linear"
                    control={<Radio />}
                    label="Linear"
                  />
                  <FormControlLabel
                    value="incremental"
                    control={<Radio />}
                    label="Incremental"
                  />
                  <FormControlLabel
                    value="waved"
                    control={<Radio />}
                    label="Waved"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <Grid
            item
            container
            columnSpacing={{ xs: 2 }}
            justifyContent="flex-start"
            style={{ marginTop: "3rem" }}
          >
            <Grid item>
              <Button
                size="large"
                variant="contained"
                onClick={() => setRunning(true)}
                disabled={running}
              >
                Start Load Test
              </Button>
            </Grid>
            <Grid item>
              <Button
                size="large"
                variant="contained"
                color="error"
                onClick={stopDdosify}
                disabled={!running}
              >
                Stop
              </Button>
            </Grid>
          </Grid>
          <Grid item container style={{ marginTop: "3rem" }}>
            <pre
              style={{
                textAlign: "left",
                backgroundColor: "rgb(52,63,69",
                border: "3px solid #999",
                padding: "20px",
                width: "100%",
              }}
            >
              {backendInfo}
            </pre>
          </Grid>
        </Grid>
      </div>
    </DockerMuiThemeProvider>
  );
}

export default App;
