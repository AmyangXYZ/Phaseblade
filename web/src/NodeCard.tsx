import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import Card from "./components/Card";
import { UnitTypes } from "./index.d.tsx";
import { NodeState } from "phaseblade";

function NodeCard({
  selectedNode,
  nodeState,
}: {
  selectedNode: number | null;
  nodeState: NodeState | null;
}) {
  const taskScheduleChartRef = useRef<echarts.EChartsType | null>(null);
  const taskScheduleChartDomRef = useRef<HTMLDivElement>(null);
  const [taskSchedule, setTaskSchedule] = useState<
    { name: string; value: number }[]
  >([]);
  const [cycle, setCycle] = useState<number>(0);

  useEffect(() => {
    if (!nodeState) return;
    const schedule: {
      name: string;
      value: number;
      itemStyle: echarts.EChartsOption;
    }[] = [];

    for (let i = 0; i < nodeState.task_schedule.length; i++) {
      const name = nodeState.task_schedule[i]?.toUpperCase();
      const slot = { name, value: 1, itemStyle: {} };
      if (name === "IDLE") {
        slot.itemStyle = { color: "rgba(48, 48, 48, 0.85)" };
      }
      schedule.push(slot);
    }

    setTaskSchedule(schedule);
    setCycle(Number(nodeState.local_cycle));
  }, [nodeState]);

  useEffect(() => {
    if (!taskScheduleChartDomRef.current) return;
    if (!taskScheduleChartRef.current) {
      taskScheduleChartRef.current = echarts.init(
        taskScheduleChartDomRef.current
      );
    }
    const option = {
      legend: {
        textStyle: {
          color: "#fff",
          fontFamily: "monospace",
        },
      },
      graphic: {
        elements: [
          {
            zlevel: 10,
            type: "polygon",
            shape: {
              points: [
                [-8, 16],
                [8, 16],
                [0, 0],
              ],
            },
            left: 373 / 2 - 8,
            bottom: 5,
            style: {
              fill: "cyan",
            },
          },
        ],
      },
      series: [
        {
          color: [
            "rgba(0, 183, 255, 0.85)", // Electric Blue
            "rgba(255, 237, 0, 0.85)", // Signature Yellow
            "rgba(255, 0, 60, 0.85)", // Hot Red
            "rgba(0, 255, 140, 0.85)", // Matrix Green
          ],
          name: "Access From",
          type: "pie",
          radius: ["48%", "78%"],
          avoidLabelOverlap: false,
          startAngle: 0,
          itemStyle: {
            borderRadius: 5,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
            color: "#fff",
            fontSize: 18,
          },
          emphasis: {
            label: {
              show: true,
            },
          },
          data: [
            {
              value: 700,
              name: "IDLE",
              itemStyle: { color: "rgba(48, 48, 48, 0.85)" },
            },
          ],
          animation: false,
          silent: true,
        },
      ],
    };
    taskScheduleChartRef.current.setOption(option);

    return () => {
      taskScheduleChartRef.current?.dispose();
      taskScheduleChartRef.current = null;
    };
  }, [selectedNode]);

  useEffect(() => {
    taskScheduleChartRef.current?.setOption({
      series: [
        {
          data: taskSchedule,
          startAngle:
            ((Number(cycle) - 1 + 0.5) * (360 / taskSchedule.length) - 90) %
            360,
        },
      ],
    });
    taskScheduleChartRef.current?.dispatchAction({
      type: "downplay",
      seriesIndex: 0,
    });
    taskScheduleChartRef.current?.dispatchAction({
      type: "highlight",
      seriesIndex: 0,
      dataIndex: (Number(cycle) - 1) % taskSchedule.length,
    });
  }, [cycle, taskSchedule]);

  return (
    <>
      {selectedNode && nodeState && (
        <>
          <Card
            title={`${UnitTypes[nodeState.unit_type].label} - ${nodeState.id}`}
            icon={<img src={UnitTypes[nodeState.unit_type].icon} />}
            subtitle="RETRIEVE VALUABLE DATA"
            body={
              <>
                <div>Retrieve and transmit the vital research data.</div>
                <div>Local cycle: {cycle}</div>
                <div
                  ref={taskScheduleChartDomRef}
                  style={{ width: "373px", height: "300px" }}
                ></div>
              </>
            }
            footer="SELECT MISSION"
            width="420px"
            style={{
              position: "absolute",
              top: "50%",
              left: "calc(50% + 100px)",
              transform: "translateY(-50%)",
              zIndex: 10,
            }}
          />
        </>
      )}
    </>
  );
}

export default NodeCard;
